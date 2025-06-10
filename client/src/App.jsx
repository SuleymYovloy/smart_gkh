import { useKeycloak } from "@react-keycloak/web";

export default function App() {
    const { keycloak } = useKeycloak();
    if (!keycloak.authenticated) {
        return (
            <button onClick={() => keycloak.login({ prompt: "login" })}>
                Войти
            </button>
        );
    }
    return <h1>Привет, {keycloak.tokenParsed.preferred_username}!</h1>;
}
