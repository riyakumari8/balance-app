# Use official Maven/Java image to build the app
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Use Alpine Java image for lightweight deployment
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install Tesseract OCR internally in the container
RUN apk add --no-cache tesseract-ocr tesseract-ocr-eng

# Copy built JAR
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Explicitly set Tessdata path for the container
ENV TESSDATA_PREFIX=/usr/share/tessdata/

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
