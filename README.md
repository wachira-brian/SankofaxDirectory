# SankofaxDirectory
React with typescript full stack directory website
sudo tail -n 50 /var/log/nginx/error.log
sudo nano /etc/nginx/sites-available/sankofax.com
sudo systemctl reload nginx

sudo nginx -t
sudo systemctl reload nginx
npm run build
sudo cp -r dist/* /var/www/sankofax
