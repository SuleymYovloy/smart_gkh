import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Divider,
    Box,
    useMediaQuery,
    Avatar,
    ListItemIcon
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useTheme } from "@mui/material/styles";
import { useKeycloak } from "@react-keycloak/web";

const drawerWidth = 280;

const navItems = [
    { label: "Главная", icon: <HomeIcon /> },
    { label: "Лицевые счета", icon: <AccountBalanceIcon /> },
    { label: "Начисления", icon: <ReceiptIcon /> },
    { label: "Оплата", icon: <PaymentIcon /> },
    { label: "История", icon: <HistoryIcon /> },
    { label: "Профиль", icon: <PersonIcon /> },
    { label: "Настройки", icon: <SettingsIcon /> },
    { label: "Выход", icon: <LogoutIcon /> }
];

export default function HomePage() {
    const { keycloak } = useKeycloak();
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [activeItem, setActiveItem] = useState("Главная");

    const drawer = (
        <Box
            sx={{
                width: drawerWidth,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                bgcolor: "#eaf4fb",
                color: "#0d47a1"
            }}
        >
            <Box
                sx={{
                    p: 2,
                    textAlign: "center",
                    position: "relative",
                    borderBottom: "1px solid #c5ddef"
                }}
            >
                <Avatar
                    sx={{
                        mx: "auto",
                        width: 64,
                        height: 64,
                        bgcolor: "#90caf9",
                        boxShadow: 2
                    }}
                >
                    USER
                </Avatar>
                <Typography variant="subtitle1" mt={1} fontWeight={500}>
                    Имя Фамилия
                </Typography>
                <Typography variant="caption" sx={{ color: "#1565c0" }}>
                    email@example.com
                </Typography>
                {isMobile && (
                    <IconButton
                        onClick={() => setMobileOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            color: "#1565c0"
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            <List>
                {navItems.map(({ label, icon }) => (
                    <React.Fragment key={label}>
                        <ListItem disablePadding>
                            <ListItemButton
                                selected={activeItem === label}
                                onClick={() => {
                                    if (label === "Выход") {
                                        keycloak.logout({
                                            redirectUri:
                                                window.location.origin + "/"
                                        });
                                    } else {
                                        setActiveItem(label);
                                        if (isMobile) setMobileOpen(false);
                                    }
                                }}
                                sx={{
                                    px: 3,
                                    "&.Mui-selected": {
                                        bgcolor: "#bbdefb",
                                        color: "#0d47a1"
                                    },
                                    "&:hover": { bgcolor: "#d6eaf8" }
                                }}
                            >
                                <ListItemIcon
                                    sx={{ color: "inherit", minWidth: 36 }}
                                >
                                    {icon}
                                </ListItemIcon>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                        {label === "История" && (
                            <Divider sx={{ my: 1, bgcolor: "#bbdefb" }} />
                        )}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f2f9fd" }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Box
                    component="nav"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        bgcolor: "#eaf4fb"
                    }}
                >
                    {drawer}
                </Box>
            )}

            {/* Mobile AppBar */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    sx={{ bgcolor: "#64b5f6", boxShadow: 1 }}
                >
                    <Toolbar>
                        <IconButton
                            edge="start"
                            onClick={() => setMobileOpen(true)}
                            sx={{ mr: 2, color: "#fff" }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            color="#fff"
                        >
                            Smart ЖКХ
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        bgcolor: "#eaf4fb",
                        color: "#0d47a1"
                    }
                }}
            >
                {drawer}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: isMobile ? 2 : 3,
                    mt: isMobile ? 8 : 0,
                    width: "100%"
                }}
            >
                <Typography
                    variant="h5"
                    gutterBottom
                    color="#0d47a1"
                    fontWeight={500}
                >
                    {activeItem}
                </Typography>
                <Box
                    mt={2}
                    p={3}
                    sx={{
                        bgcolor: "#ffffff",
                        borderRadius: 2,
                        boxShadow: 1,
                        minHeight: 300,
                        border: "1px solid #bbdefb"
                    }}
                >
                    Здесь отображается контент раздела: <b>{activeItem}</b>
                </Box>
            </Box>
        </Box>
    );
}
