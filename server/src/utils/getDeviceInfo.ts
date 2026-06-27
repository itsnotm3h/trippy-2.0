import { Request } from "express";

export const getDeviceInfo = (req:Request)=>{
    
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const browser = req.useragent?.browser || 'Unknown Browser';
    const os = req.useragent?.os || 'Unknown OS';
    const isMobile = req.useragent?.isMobile ? 'Mobile' : 'Desktop';

    
    const deviceInfo = JSON.stringify({
      browser,
      os,
      device: isMobile,
      ipAddress,
    });

    return deviceInfo;
}