package com.example.tensorflowllm;

// NOTE: This Spring Boot/TensorFlow sample is not wired into the Node/Express
// runtime in this repository. It remains as a standalone experiment.

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.tensorflow.*;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class TensorFlowLlmApplication extends WebSecurityConfigurerAdapter {

    public static void main(String[] args) {
        SpringApplication.run(TensorFlowLlmApplication.class, args);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/api/llm").authenticated()
            .and()
            .httpBasic();
    }

    @Bean
    public SavedModelBundle tensorFlowModel() throws Exception {
        String modelPath = "path/to/your/saved_model";
        return SavedModelBundle.load(modelPath, "serve");
    }

    @RestController
    @RequestMapping("/api")
    public static class LlmController {

        private final SavedModelBundle model;

        public LlmController(SavedModelBundle model) {
            this.model = model;
        }

        @PostMapping(value = "/llm", consumes = "application/json", produces = "application/json")
        public ResponseEntity<Response> processMessage(@RequestBody Request request) {
            String userMessage = request.getMessage();
            String responseMessage = processWithTensorFlowLLM(userMessage);
            return ResponseEntity.ok(new Response(responseMessage));
        }

        private String processWithTensorFlowLLM(String message) {
            try (Tensor<String> inputTensor = Tensors.create(message);
                 Tensor<?> result = model.session().runner()
                     .feed("input_tensor_name", inputTensor)
                     .fetch("output_tensor_name")
                     .run()
                     .get(0)) {
                // Process the result tensor and convert it to a string
                return resultToString(result);
            }
        }

        private String resultToString(Tensor<?> result) {
            // Implement this method based on your model's output format
            return new String(result.bytesValue());
        }
    }

    public static class Request {
        private String message;

        public Request() { }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class Response {
        private String response;

        public Response(String response) {
            this.response = response;
        }

        public String getResponse() {
            return response;
        }

        public void setResponse(String response) {
            this.response = response;
        }
    }
}
