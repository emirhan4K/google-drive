# İşletim sistemi ve Node.js versiyonu (Hafif ve hızlı olması için alpine sürümü)
FROM node:20-alpine

# Docker içindeki ana çalışma klasörümüz
WORKDIR /app

# Önce paket listelerini kopyala 
COPY package*.json ./

#Kütüphaneleri sıfırdan, Linux çekirdeğine uygun şekilde kur
RUN npm install

# Kalan tüm dosyaları (src klasörü, tsconfig vb.) kopyala
COPY . .

# NestJS'in varsayılan portunu dışarı aç
EXPOSE 3000

# 7. Canlı (prod) yerine geliştirme (dev) modunda başlat
CMD ["npm", "run", "start:dev"]