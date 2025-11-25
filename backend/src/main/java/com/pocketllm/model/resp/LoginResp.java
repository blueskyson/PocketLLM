package com.pocketllm.model.resp;

public class LoginResp {
    private String userUuid;
    private String email;

    public LoginResp(String uuid, String email) {
        this.userUuid = uuid;
        this.email = email;
    }

    public String getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(String userUuid) {
        this.userUuid = userUuid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
