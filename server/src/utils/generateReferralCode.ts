import Crypto from 'node:crypto';

export const generateReferralCode = (length:number=8)=>{
    return Crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}