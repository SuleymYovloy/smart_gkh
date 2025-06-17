import React, { useEffect, useState } from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    TextField,
    Divider,
    Button,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const ACCOUNT = "user1"; // демонстрационный пользователь

const startServices = [
    {
        id: "cold",
        name: "Холодная вода",
        prev: 340,
        rate: 45,
        current: "",
        status: "unpaid"
    },
    {
        id: "hot",
        name: "Горячая вода",
        prev: 104,
        rate: 180,
        current: "",
        status: "unpaid"
    },
    {
        id: "elect",
        name: "Электроэнергия",
        prev: 12400,
        rate: 5.5,
        current: "",
        status: "unpaid"
    }
];

export default function PaymentPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [services, setServices] = useState(startServices);
    const [balance, setBalance] = useState(null); // null → ждём fetch
    const [snack, setSnack] = useState({
        open: false,
        msg: "",
        sev: "success"
    });
    const navigate = useNavigate();
    const { keycloak } = useKeycloak();

    const total = services.reduce((sum, s) => {
        const cur = parseFloat(s.current);
        return s.current && !isNaN(cur) && cur >= s.prev
            ? sum + (cur - s.prev) * s.rate
            : sum;
    }, 0);

    /* ───────── универсальный fetch */
    const api = async (path, options = {}) => {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };
        if (keycloak.token) headers.Authorization = `Bearer ${keycloak.token}`;

        const res = await fetch(`${BACKEND}${path}`, {
            ...options,
            headers,
            credentials: "include"
        });

        if (!res.ok) {
            let detail = "Ошибка";
            try {
                detail = (await res.json()).detail || detail;
            } catch {
                // если не удалось получить json, оставляем "Ошибка"
                detail = "Ошибка при получении данных";
            }
            throw new Error(detail);
        }
        return res.json();
    };

    /* ───────── начальный fetch баланса */
    useEffect(() => {
        api(`/balance/${ACCOUNT}`)
            .then((data) => setBalance(data.balance))
            .catch(() => setBalance(0));
    }, []);

    /* ───────── helpers */
    const show = (msg, sev) => setSnack({ open: true, msg, sev });

    /* ───────── оплатить всё */
    const payAll = async () => {
        if (!total) {
            show("Сумма 0", "warning");
            return;
        }
        try {
            await api("/pay", {
                method: "POST",
                body: JSON.stringify({
                    user_id: ACCOUNT,
                    amount: total,
                    service: "Все"
                })
            });
            setServices((arr) => arr.map((it) => ({ ...it, status: "paid" })));
            show("Оплата прошла", "success");
        } catch (e) {
            show(e.message, "error");
        }
    };

    /* ───────── оплатить конкретную услугу */
    const payOne = async (idx) => {
        const row = services[idx];
        const cur = parseFloat(row.current);
        if (!row.current || isNaN(cur) || cur < row.prev) {
            show("Неверные показания", "error");
            return;
        }

        const amount = (cur - row.prev) * row.rate;
        if (!amount) {
            show("Сумма 0", "warning");
            return;
        }

        try {
            await api("/pay", {
                method: "POST",
                body: JSON.stringify({
                    user_id: ACCOUNT,
                    amount,
                    service: row.name
                })
            });
            setServices((arr) =>
                arr.map((r, i) => (i === idx ? { ...r, status: "paid" } : r))
            );
            show(`Оплачено ${amount.toFixed(2)} ₽`, "success");
        } catch (e) {
            show(e.message, "error");
        }
    };

    return (
        <Box sx={{ bgcolor: "#f5f5f7", minHeight: "100vh", display: "flex" }}>
            <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 4 }}>
                <Button onClick={() => navigate("/home")}>Назад</Button>
                {/* mobile‑шапка */}
                {isMobile && (
                    <AppBar
                        position="static"
                        elevation={0}
                        color="transparent"
                        sx={{ mb: 2 }}
                    >
                        <Toolbar>
                            <IconButton edge="start">
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                variant="h6"
                                sx={{ flex: 1 }}
                                textAlign="center"
                            >
                                Оплата
                            </Typography>
                        </Toolbar>
                    </AppBar>
                )}

                <Typography variant="h5" mb={3}>
                    Оплата услуг
                </Typography>

                <Card sx={{ border: "1px solid #ccc", bgcolor: "#fff" }}>
                    <CardContent>
                        <Typography>Счёт №ХХХХХХХХХХ</Typography>
                        <Typography variant="caption" display="block">
                            Адрес: г. Пример, ул. Улица, д. 1
                        </Typography>
                        <Typography fontWeight={500} mt={1}>
                            К оплате:{" "}
                            {balance === null
                                ? "…"
                                : balance.toLocaleString("ru")}{" "}
                            ₽
                        </Typography>
                    </CardContent>
                </Card>

                <Typography mt={4} mb={1} fontWeight={500}>
                    Показания счётчиков
                </Typography>
                <Grid container spacing={2}>
                    {services.map((s, idx) => {
                        const cur = parseFloat(s.current);
                        const canPay =
                            s.status === "unpaid" &&
                            s.current &&
                            !isNaN(cur) &&
                            cur >= s.prev;
                        const sum = canPay ? (cur - s.prev) * s.rate : 0;
                        return (
                            <Grid item xs={12} md={4} key={s.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography fontWeight={500}>
                                            {s.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Пред: {s.prev}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Текущие"
                                            sx={{ mt: 1 }}
                                            value={s.current}
                                            onChange={(e) =>
                                                setServices((arr) =>
                                                    arr.map((r, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...r,
                                                                  current:
                                                                      e.target
                                                                          .value
                                                              }
                                                            : r
                                                    )
                                                )
                                            }
                                        />
                                        {canPay && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{ mt: 2 }}
                                                onClick={() => payOne(idx)}
                                            >
                                                Оплатить {sum.toFixed(2)} ₽
                                            </Button>
                                        )}
                                        {s.status === "paid" && (
                                            <Typography mt={2} color="green">
                                                ✅ Оплачено
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                <Card sx={{ border: "1px solid #ccc", bgcolor: "#fff", mt: 4 }}>
                    <CardContent>
                        <Typography fontWeight={500}>Итого к оплате</Typography>
                        <Typography variant="h6" color="primary" mt={1}>
                            {total.toFixed(2)} ₽
                        </Typography>
                        <Typography variant="caption">Комиссия: 0 ₽</Typography>
                    </CardContent>
                </Card>

                <Box mt={3} display="flex" gap={2}>
                    <Button
                        variant="contained"
                        onClick={payAll}
                        sx={{ textTransform: "none", minWidth: 120 }}
                    >
                        Оплатить
                    </Button>
                    <Button variant="outlined" sx={{ textTransform: "none" }}>
                        Отмена
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
            >
                <Alert
                    severity={snack.sev}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
