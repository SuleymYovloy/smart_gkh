import React from "react";
import ReactDOM from "react-dom/client";
import Keycloak from "keycloak-js";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import App from "./App";

// Настройки адаптера
const keycloak = new Keycloak({
    prompt: "login",
    url: "http://localhost:9080",
    realm: "smart-hcs",
    clientId: "postman-client"
});
const initOptions = {
    onLoad: "check-sso", // проверяем сессию
    silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
    pkceMethod: "S256"
};
const loginOptions = {
    prompt: "login",
    redirectUri: window.location.origin + "/home"
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <ReactKeycloakProvider
        authClient={keycloak}
        initOptions={initOptions}
        loginOptions={loginOptions}
    >
        <App />
    </ReactKeycloakProvider>
);
