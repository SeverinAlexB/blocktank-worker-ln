import { readFileSync } from 'fs';
import { ILndNodeConfig } from '../config/ILndNodeConfig';

export interface ILndConnectionInfo {
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

export function readLndConnectionInfo2(config: ILndNodeConfig): ILndConnectionInfo {
  return readLndConnectionInfo(config.certPath, config.macaroonPath, config.grpcSocket)
}

export function readLndConnectionInfo(tlsCertificatePath: string, macaroonPath: string, grpcSocketUrl: string): ILndConnectionInfo {
    return {
        tlsCertificate: readToBase64(tlsCertificatePath),
        macaroon: readToBase64(macaroonPath),
        grpcSocketUrl: grpcSocketUrl
    }
}