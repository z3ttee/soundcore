
export class ID3TagsDTO {

    public filepath: string;
    public title: string;
    public duration: number;
    public artists: { name: string }[];
    public album: string;
    public cover: Buffer;
    public orderNr: number;

}