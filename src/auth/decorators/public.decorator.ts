import { SetMetadata } from '@nestjs/common'; //Endpointlerin kapısına görünmez not yapıştırmamızı sağlar

export const IS_PUBLIC_KEY = 'isPublic'; //Bu kelimeyi ara 
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); //@Public() endpointleri true yapacak