
package com.pocketllm.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;

@Component
public class HttpClientUtil {

    private final HttpClient client;
    private final Duration requestTimeout;

    public HttpClientUtil(@Value("${http.client.connect-timeout}") Duration connectTimeout,
                          @Value("${http.client.request-timeout}") Duration requestTimeout) {
        this.client = HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .build();
        this.requestTimeout = requestTimeout;
    }

    public String postJson(String url, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(requestTimeout)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
