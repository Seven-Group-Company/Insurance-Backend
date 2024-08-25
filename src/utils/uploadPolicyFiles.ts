import cloudinary from "./cloudinary";

const uploadPolicyFiles: any = async (file: any, path) => {
  try {
    let url;
    await cloudinary.uploader.upload(
      file,
      {
        folder: path,
        resource_type: "raw",
      },
      (err: any, result: any) => {
        if (err) {
          return "Error uploading file";
        }
        url = result.secure_url;
      }
    );
    return url;
  } catch (error) {
    throw { message: "Unable to upload file", error };
  }
};

export default uploadPolicyFiles;
