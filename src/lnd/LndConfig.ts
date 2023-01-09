import { readFileSync } from 'fs';

export interface ILndConfig {
    tlsCertificate: string,
    macaroon: string,
    grpcSocketUrl: string
}


const readToBase64 = (path: string) => {
    try{
      return readFileSync(path, { encoding: 'base64' })
    } catch(err){
      return path
    }
  }

export function readLndConfig(tlsCertificatePath: string, macaroonPath: string, grpcSocketUrl: string): ILndConfig {
    return {
        tlsCertificate: readToBase64(tlsCertificatePath),
        macaroon: readToBase64(macaroonPath),
        grpcSocketUrl: grpcSocketUrl
    }
}