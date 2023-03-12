
export interface ID3Artist {
    name: string;
}

export class ID3TagsDTO {

    public filepath: string;
    public title: string;
    public duration: number;
    public artists: ID3Artist[];
    public album: string;
    public cover: Buffer;
    public orderNr: number;

}