# Use the official Nginx image as the base image
FROM nginx:latest

# Set the working directory
WORKDIR /usr/share/nginx/html

# Copy the index.html file to the Nginx HTML directory
COPY ./index.html .

# Copy the JavaScript file to the js directory
COPY ./js/app.js ./js/

# Copy the CSS file to the css directory
COPY ./css/styles.css ./css/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]