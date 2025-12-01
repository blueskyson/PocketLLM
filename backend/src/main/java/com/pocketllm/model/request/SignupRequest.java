package com.pocketllm.model.request;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class SignupRequest {
    private String email;
    private String password;
}
