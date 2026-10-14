FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/banco-api.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
