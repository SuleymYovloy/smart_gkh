import React, { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Avatar } from "@mui/material";

export default function LoginPage() {
    const { keycloak } = useKeycloak();
    const navigate = useNavigate();

    useEffect(() => {
        if (keycloak.authenticated) {
            navigate("/home");
        }
    }, [keycloak.authenticated, navigate]);

    if (!keycloak.authenticated) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="#f2f9fd"
            >
                <Box
                    width={{ xs: "100%", sm: 360 }}
                    bgcolor="#ffffff"
                    px={{ xs: 3, sm: 4 }}
                    py={5}
                    mx={2}
                    textAlign="center"
                    borderRadius={2}
                    boxShadow={2}
                    border="1px solid #bbdefb"
                >
                    <Avatar
                        sx={{
                            bgcolor: "#90caf9",
                            width: 64,
                            height: 64,
                            margin: "0 auto",
                            mb: 2,
                            boxShadow: 1,
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            color: "#0d47a1"
                        }}
                    >
                        LOGO
                    </Avatar>

                    <Typography variant="h6" fontWeight={500} color="#0d47a1">
                        Добро пожаловать
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ mt: 0.5, fontSize: "0.75rem", color: "#1565c0" }}
                    >
                        Войдите через Keycloak
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => keycloak.login({ prompt: "login" })}
                        sx={{
                            mt: 3,
                            textTransform: "none",
                            backgroundColor: "#64b5f6",
                            color: "#fff",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            height: 42,
                            "&:hover": {
                                backgroundColor: "#42a5f5"
                            }
                        }}
                    >
                        Войти через Keycloak
                    </Button>

                    <Typography
                        variant="caption"
                        sx={{
                            mt: 3,
                            display: "block",
                            fontSize: "0.7rem",
                            color: "#777"
                        }}
                    >
                        Используется корпоративная система авторизации
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            mt: 2,
                            display: "block",
                            fontSize: "0.7rem",
                            color: "#90a4ae"
                        }}
                    >
                        © 2025 Smart ЖКХ
                    </Typography>
                </Box>
            </Box>
        );
    }

    return null;
}
