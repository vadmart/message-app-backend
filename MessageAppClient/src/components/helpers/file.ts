 export const getFileName = (path: string): string => {
    const pathArr = path.split("/");
    return pathArr[pathArr.length - 1]
 }