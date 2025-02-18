const Cloudinary = () => {
    const uploadImageToCloudinary = async (imageUri,UPLOAD_PRESET,CLOUD_NAME) => {
        const data = new FormData();
        data.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "upload.jpg",
        });
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);
    
        try {
            let response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: data,
            });
            let result = await response.json();
            return result.secure_url;
        } catch (error) {
            console.error("Upload error:", error);
            return null;
        }
    };
    return ( {
        uploadImageToCloudinary
    } );
}
 
export default Cloudinary;