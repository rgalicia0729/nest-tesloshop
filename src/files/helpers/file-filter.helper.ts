
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file) return callback(null, false);

    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
    const fileExtensions = file.mimetype.split('/')[1];

    if (!validExtensions.includes(fileExtensions)) return callback(null, false);

    callback(null, true);
}