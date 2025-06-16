// Страница: Заявки жильца (TasksPage.tsx)
import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    Paper,
    InputLabel,
    Select,
    FormControl,
    useMediaQuery,
    useTheme,
    Divider,
    Stack,
    Chip,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Rating,
    Tooltip,
    IconButton
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const categories = [
    { value: "plumbing", label: "Сантехника" },
    { value: "electricity", label: "Электрика" },
    { value: "cleaning", label: "Уборка" },
    { value: "elevator", label: "Лифт" },
    { value: "other", label: "Другое" }
];

export default function TasksPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("plumbing");
    const [file, setFile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [rating, setRating] = useState({});

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchTasks = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/v1/tasks");
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error("Ошибка при загрузке заявок:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/v1/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    priority: "normal"
                })
            });

            if (response.ok) {
                alert("Заявка отправлена успешно!");
                setTitle("");
                setDescription("");
                setFile(null);
                setCategory("plumbing");
                fetchTasks();
            } else {
                alert("Ошибка при отправке заявки.");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка");
        }
    };

    const handleRate = async (taskId, value) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/v1/tasks/${taskId}/rate`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rating: value })
                }
            );
            if (response.ok) {
                setRating((prev) => ({ ...prev, [taskId]: value }));
                fetchTasks();
            }
        } catch (error) {
            console.error("Ошибка при оценке:", error);
        }
    };

    return (
        <Box
            p={isMobile ? 2 : 4}
            display="flex"
            justifyContent="center"
            sx={{ backgroundColor: "#f3f6f9", minHeight: "100vh" }}
        >
            <Box width="100%" maxWidth={750}>
                <Typography
                    variant={isMobile ? "h5" : "h4"}
                    gutterBottom
                    fontWeight="bold"
                >
                    📝 Создание заявки
                </Typography>

                <Paper
                    elevation={4}
                    sx={{ p: isMobile ? 2 : 4, borderRadius: 3, mb: 4 }}
                >
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Заголовок проблемы"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Описание"
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <FormControl fullWidth>
                            <InputLabel id="category-label">
                                Категория
                            </InputLabel>
                            <Select
                                labelId="category-label"
                                value={category}
                                label="Категория"
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AttachFileIcon />}
                            fullWidth={isMobile}
                        >
                            Прикрепить файл
                            <input
                                hidden
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => {
                                    if (e.target.files)
                                        setFile(e.target.files[0]);
                                }}
                            />
                        </Button>
                        {file && (
                            <Typography variant="body2" color="text.secondary">
                                📎 Файл выбран: {file.name}
                            </Typography>
                        )}

                        <Divider />

                        <Button
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={handleSubmit}
                            size={isMobile ? "medium" : "large"}
                            fullWidth
                            sx={{ fontWeight: "bold" }}
                        >
                            Отправить заявку
                        </Button>
                    </Stack>
                </Paper>

                {tasks.length > 0 && (
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            🧾 Мои заявки
                        </Typography>
                        <List>
                            {tasks.map((task) => (
                                <Box key={task.id}>
                                    <ListItem
                                        divider
                                        alignItems="flex-start"
                                        onClick={() =>
                                            setExpandedTaskId(
                                                expandedTaskId === task.id
                                                    ? null
                                                    : task.id
                                            )
                                        }
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <ListItemText
                                            primary={`[${task.id}] ${task.title}`}
                                            secondary={`Счёт: ${
                                                task.accountId
                                            } • Категория: ${
                                                task.category
                                            } • Приоритет: ${
                                                task.priority
                                            } • Статус: ${
                                                task.status
                                            } • ${new Date(
                                                task.createdAt
                                            ).toLocaleString()}`}
                                        />
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            {task.status === "done" &&
                                                !task.rating && (
                                                    <Tooltip title="Нажмите, чтобы оставить отзыв">
                                                        <IconButton size="small">
                                                            <ArrowForwardIcon color="primary" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            <Chip
                                                label={task.status}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </ListItem>

                                    <Collapse
                                        in={expandedTaskId === task.id}
                                        timeout="auto"
                                        unmountOnExit
                                    >
                                        <Box px={2} pb={2}>
                                            <Typography
                                                variant="subtitle2"
                                                gutterBottom
                                            >
                                                🧑‍🔧 Исполнитель:{" "}
                                                {task.assignee?.name ||
                                                    "не назначен"}{" "}
                                                ({task.assignee?.role || "-"})
                                            </Typography>

                                            {task.attachments &&
                                                task.attachments.length > 0 && (
                                                    <Box mb={2}>
                                                        <Typography variant="body2">
                                                            📎 Вложения:
                                                        </Typography>
                                                        {task.attachments.map(
                                                            (file, index) => (
                                                                <Box
                                                                    key={index}
                                                                >
                                                                    <a
                                                                        href={
                                                                            file.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {file.url
                                                                            .split(
                                                                                "/"
                                                                            )
                                                                            .pop()}
                                                                    </a>
                                                                </Box>
                                                            )
                                                        )}
                                                    </Box>
                                                )}

                                            <Typography
                                                variant="subtitle2"
                                                gutterBottom
                                            >
                                                <HistoryIcon
                                                    fontSize="small"
                                                    sx={{ mr: 0.5 }}
                                                />{" "}
                                                История:
                                            </Typography>
                                            {task.history &&
                                            task.history.length > 0 ? (
                                                <List dense>
                                                    {task.history.map(
                                                        (h, i) => (
                                                            <ListItem key={i}>
                                                                <ListItemText
                                                                    primary={`• ${h.action}`}
                                                                    secondary={`${new Date(
                                                                        h.timestamp
                                                                    ).toLocaleString()} — ${
                                                                        h.user
                                                                    }`}
                                                                />
                                                            </ListItem>
                                                        )
                                                    )}
                                                </List>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Нет записей истории
                                                </Typography>
                                            )}

                                            <Divider sx={{ my: 2 }} />
                                            <Typography
                                                variant="body2"
                                                gutterBottom
                                            >
                                                Оцените качество выполнения:
                                            </Typography>
                                            <Rating
                                                name={`rating-${task.id}`}
                                                value={
                                                    task.rating ||
                                                    rating[task.id] ||
                                                    0
                                                }
                                                onChange={(event, newValue) =>
                                                    handleRate(
                                                        task.id,
                                                        newValue
                                                    )
                                                }
                                            />
                                        </Box>
                                    </Collapse>
                                </Box>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}
