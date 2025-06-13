import React, { useState } from "react";
import {
    Box,
    Typography,
    useMediaQuery,
    useTheme,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Card,
    CardContent,
    Snackbar,
    Alert,
    CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
// import { useKeycloak } from "@react-keycloak/web";

const data = [
    {
        service: "Холодная вода",
        volume: "15 м³",
        rate: "45 руб/м³",
        cost: "675 руб",
        readings: "340 → 355"
    },
    {
        service: "Горячая вода",
        volume: "8 м³",
        rate: "180 руб/м³",
        cost: "1440 руб",
        readings: "104 → 112"
    },
    {
        service: "Электроэнергия",
        volume: "250 кВт⋅ч",
        rate: "5.5 руб/кВт⋅ч",
        cost: "1375 руб",
        readings: "12400 → 12650"
    }
];

const totalAmount = data.reduce(
    (sum, item) => sum + parseFloat(item.cost.replace(" руб", "")),
    0
);

export default function AccrualsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    // const { keycloak } = useKeycloak();
    const [loading, setLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });
    const navigate = useNavigate();
    const getLast6Months = () => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = date.toLocaleString("ru-RU", {
                month: "long",
                year: "numeric"
            });
            const value = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
            months.push({ label, value });
        }
        return months;
    };

    const periods = getLast6Months();
    const [selectedPeriod, setSelectedPeriod] = useState(periods[0].value);

    const handlePay = () => {
        if (!selectedAccount) {
            setSnackbar({
                open: true,
                message: "Пожалуйста, выберите счёт",
                severity: "error"
            });
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSnackbar({
                open: true,
                message: "Оплата прошла успешно (имитация)",
                severity: "success"
            });
        }, 2000);
    };

    const selectStyles = {
        bgcolor: "#eaf4fb",
        borderRadius: 2,
        "& .MuiInputBase-root": { height: 56 },
        "& .MuiInputLabel-root": { fontSize: "0.9rem", top: "-6px" }
    };

    return (
        <Box
            sx={{ bgcolor: "#f2f9fd", minHeight: "100vh", p: isMobile ? 2 : 4 }}
        >
            <Button onClick={() => navigate("/home")}>Назад</Button>
            <Typography variant="h5" mb={5} color="#0d47a1" fontWeight={500}>
                Начисления
            </Typography>

            <Box
                display="flex"
                gap={2}
                flexDirection={isMobile ? "column" : "row"}
                mb={3}
            >
                <FormControl fullWidth sx={selectStyles}>
                    <InputLabel>Выбрать счёт</InputLabel>
                    <Select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                        <MenuItem value="acc1">Лицевой счёт 1</MenuItem>
                        <MenuItem value="acc2">Лицевой счёт 2</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={selectStyles}>
                    <InputLabel>Период</InputLabel>
                    <Select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        label="Период"
                    >
                        {periods.map(({ label, value }) => (
                            <MenuItem key={value} value={value}>
                                {label.charAt(0).toUpperCase() + label.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {!isMobile && (
                    <Button variant="outlined" sx={{ height: 56 }}>
                        Фильтр
                    </Button>
                )}
            </Box>

            <Box
                p={2}
                bgcolor="#fff"
                border="1px solid #bbdefb"
                borderRadius={2}
                mb={3}
            >
                <Typography fontWeight={500} mb={1}>
                    Итого за{" "}
                    {periods.find((p) => p.value === selectedPeriod)?.label}
                </Typography>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h6" color="#0d47a1">
                        {totalAmount} руб
                    </Typography>
                    {!isMobile && (
                        <Button
                            variant="contained"
                            onClick={handlePay}
                            disabled={loading}
                            startIcon={
                                loading && (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                )
                            }
                        >
                            {loading
                                ? "Оплата..."
                                : `Оплатить ${totalAmount} ₽`}
                        </Button>
                    )}
                </Box>
            </Box>

            {!isMobile && (
                <Table sx={{ bgcolor: "#fff", border: "1px solid #bbdefb" }}>
                    <TableHead sx={{ bgcolor: "#eaf4fb" }}>
                        <TableRow>
                            <TableCell>Услуга</TableCell>
                            <TableCell>Объём</TableCell>
                            <TableCell>Тариф</TableCell>
                            <TableCell>Начислено</TableCell>
                            <TableCell>Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.service}>
                                <TableCell>{item.service}</TableCell>
                                <TableCell>{item.volume}</TableCell>
                                <TableCell>{item.rate}</TableCell>
                                <TableCell>{item.cost}</TableCell>
                                <TableCell>
                                    <input type="radio" name="pay" />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={3} />
                            <TableCell fontWeight={500}>ИТОГО</TableCell>
                            <TableCell fontWeight={500}>
                                {totalAmount} руб
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {isMobile && (
                <Box display="flex" flexDirection="column" gap={2}>
                    {data.map((item) => (
                        <Card key={item.service} variant="outlined">
                            <CardContent>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                >
                                    <Typography fontWeight={500}>
                                        {item.service}
                                    </Typography>
                                    <Typography fontWeight={500}>
                                        {item.cost}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    {item.volume} × {item.rate}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Показания: {item.readings}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                    <Button variant="contained" sx={{ mt: 2, height: 48 }}>
                        Оплатить {totalAmount} руб
                    </Button>
                </Box>
            )}
        </Box>
    );
}
