export default function capitalize(str: string): string {
    let first_letter = str[0];
    first_letter = first_letter.toUpperCase();
    str = str.substring(1);
    return first_letter + str
}