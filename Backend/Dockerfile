# Use a modern, stable JDK to match your local development
FROM eclipse-temurin:21-jdk

# Set working directory inside the container
WORKDIR /app

# Copy all the backend code into the container
COPY . .

# Give execution rights to the Maven wrapper
RUN chmod +x mvnw

# Build the JAR file (skipping tests for speed)
RUN ./mvnw clean package -DskipTests

# Expose port 8080 for Render
EXPOSE 8080

# Use the shell form of CMD so the *.jar wildcard works perfectly!
CMD java -jar target/*.jar