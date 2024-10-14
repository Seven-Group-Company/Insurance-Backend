#!/bin/bash

# Variables name
DOMAIN="sgc.greatsohis.online"
EMAIL="emmanueleshunjnr@gmail.com"

# Update package lists
sudo apt update -y

# Install Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Create Nginx configuration
cat <<EOL | sudo tee /etc/nginx/sites-available/$DOMAIN
server {
	
	server_name $DOMAIN www.$DOMAIN;
        location / {
                proxy_pass http://localhost:8888;
        }
}
EOL

# Enable Nginx configuration
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Obtain SSL certificate
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -m $EMAIL --agree-tos --non-interactive

sudo nginx -t
sudo systemctl reload nginx

# Print completion message
echo "Nginx has been configured to proxy pass to localhost:9999 and SSL has been set up with Certbot."
