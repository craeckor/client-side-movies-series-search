# Use the official Apache HTTP Server image from the Docker Hub
FROM httpd:2.4

# Copy the HTML file and assets folder to the Apache web server's document root
COPY ./html /usr/local/apache2/htdocs/
COPY ./assets /usr/local/apache2/htdocs/assets/

# Expose port 80
EXPOSE 80

# Start the Apache server
CMD ["httpd-foreground"]