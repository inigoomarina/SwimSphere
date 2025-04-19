import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

const ImageCropper = ({ src, aspect, onCropComplete, circularCrop = false }) => {
    const [crop, setCrop] = useState({
        unit: '%',
        width: 90,
        height: aspect ? 90 / aspect : 90,
        x: 5,
        y: 5
    });
    const imgRef = useRef(null);
    const [completedCrop, setCompletedCrop] = useState(null);

    const onImageLoad = (e) => {
        imgRef.current = e.target;
    };

    const getCroppedImg = () => {
        if (!completedCrop || !imgRef.current) return null;
        
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
        
        const pixelRatio = window.devicePixelRatio;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY
        );
        
        return canvas.toDataURL('image/jpeg');
    };

    const handleCropComplete = (crop, percentCrop) => {
        setCompletedCrop(crop);
        
        // Generate cropped image and pass to parent
        if (crop.width && crop.height) {
            const croppedImageData = getCroppedImg();
            if (croppedImageData && onCropComplete) {
                onCropComplete(croppedImageData);
            }
        }
    };

    return (
        <div className="image-cropper">
            {src && (
                <>
                    <ReactCrop
                        src={src}
                        crop={crop}
                        ruleOfThirds
                        onComplete={handleCropComplete}
                        onChange={setCrop}
                        aspect={aspect}
                        circularCrop={circularCrop}
                    >
                        <img 
                            src={src} 
                            onLoad={onImageLoad} 
                            alt="Crop preview" 
                            style={{ maxHeight: '60vh', maxWidth: '100%' }}
                        />
                    </ReactCrop>
                    
                    <div className="cropper-instructions">
                        <p>Drag to reposition. Drag corners to resize.</p>
                        {circularCrop ? (
                            <p>Creating a circular profile picture.</p>
                        ) : (
                            <p>Creating a banner image.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageCropper;
