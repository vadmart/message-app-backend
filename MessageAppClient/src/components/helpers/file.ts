 export const getFileName = (path: string): string => {
    const pathArr = path.split("/");
    return pathArr[pathArr.length - 1]
 }

 export const getFileExtension = (path: string): RegExpExecArray => {
    return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined
 }