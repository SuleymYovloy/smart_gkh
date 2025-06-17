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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CommentIcon from "@mui/icons-material/Comment";
import PersonIcon from "@mui/icons-material/Person";

const categories = [
    { value: "plumbing", label: "Сантехника" },
    { value: "electricity", label: "Электрика" },
    { value: "cleaning", label: "Уборка" },
    { value: "elevator", label: "Лифт" },
    { value: "other", label: "Другое" }
];

const statusLabels = {
    in_progress: "В работе",
    pending: "Ожидает",
    done: "Выполнено",
    cancelled: "Отменено"
};

export default function TasksPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("plumbing");
    const [file, setFile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [rating, setRating] = useState({});

    // Состояния для диалогов
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [assigneeData, setAssigneeData] = useState({
        name: "",
        role: "",
        id: ""
    });
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/api/v1/tasks", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/v1/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
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
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
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

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8000/api/v1/tasks/${selectedTaskId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ comment: newComment })
                }
            );

            if (response.ok) {
                setNewComment("");
                setCommentDialogOpen(false);
                fetchTasks();
                alert("Комментарий добавлен!");
            } else {
                alert("Ошибка при добавлении комментария");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка");
        }
    };

    const handleUpdateAssignee = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8000/api/v1/tasks/${selectedTaskId}/assignee`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        assignee_id: assigneeData.id,
                        assignee_name: assigneeData.name,
                        assignee_role: assigneeData.role
                    })
                }
            );

            if (response.ok) {
                setAssigneeData({ name: "", role: "", id: "" });
                setAssigneeDialogOpen(false);
                fetchTasks();
                alert("Исполнитель обновлен!");
            } else {
                alert("Ошибка при обновлении исполнителя");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка");
        }
    };

    const openCommentDialog = (taskId) => {
        setSelectedTaskId(taskId);
        setCommentDialogOpen(true);
    };

    const openAssigneeDialog = (taskId, currentAssignee) => {
        setSelectedTaskId(taskId);
        setAssigneeData({
            name: currentAssignee?.name || "",
            role: currentAssignee?.role || "",
            id: currentAssignee?.id || ""
        });
        setAssigneeDialogOpen(true);
    };

    const getActionLabel = (action) => {
        const actionLabels = {
            created: "Создана",
            comment_added: "Добавлен комментарий",
            assignee_updated: "Обновлен исполнитель",
            rated: "Оценена",
            status_changed_from_in_progress_to_done:
                "Статус изменен: В работе → Выполнено",
            status_changed_from_pending_to_in_progress:
                "Статус изменен: Ожидает → В работе",
            status_changed_from_in_progress_to_cancelled:
                "Статус изменен: В работе → Отменено"
        };
        return actionLabels[action] || action;
    };

    return (
        <Box sx={{ bgcolor: "#f5f5f7", minHeight: "100vh" }}>
            <Box
                maxWidth={750}
                display="flex"
                flexDirection="column"
                mx="auto"
                p={3}
            >
                <Button
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                    onClick={() => navigate("/home")}
                >
                    Назад
                </Button>
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
                                            primary={`${task.title}`}
                                            secondary={`Счёт: ${
                                                task.accountId
                                            } • Категория: ${
                                                categories.find(
                                                    (c) =>
                                                        c.value ===
                                                        task.category
                                                )?.label || task.category
                                            } • Приоритет: ${
                                                task.priority
                                            } • Статус: ${
                                                statusLabels[task.status] ||
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
                                                label={
                                                    statusLabels[task.status] ||
                                                    task.status
                                                }
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
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                mb={2}
                                            >
                                                <Button
                                                    size="small"
                                                    startIcon={<CommentIcon />}
                                                    onClick={() =>
                                                        openCommentDialog(
                                                            task.id
                                                        )
                                                    }
                                                >
                                                    Добавить комментарий
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<PersonIcon />}
                                                    onClick={() =>
                                                        openAssigneeDialog(
                                                            task.id,
                                                            task.assignee
                                                        )
                                                    }
                                                >
                                                    Назначить исполнителя
                                                </Button>
                                            </Stack>

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

                                            {/* Комментарии */}
                                            {task.comments &&
                                                task.comments.length > 0 && (
                                                    <Box mb={2}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            gutterBottom
                                                        >
                                                            💬 Комментарии:
                                                        </Typography>
                                                        <List dense>
                                                            {task.comments.map(
                                                                (
                                                                    comment,
                                                                    i
                                                                ) => (
                                                                    <ListItem
                                                                        key={i}
                                                                        sx={{
                                                                            pl: 0
                                                                        }}
                                                                    >
                                                                        <ListItemText
                                                                            primary={
                                                                                comment.comment
                                                                            }
                                                                            secondary={`${new Date(
                                                                                comment.timestamp
                                                                            ).toLocaleString()} — ${
                                                                                comment.user
                                                                            }`}
                                                                        />
                                                                    </ListItem>
                                                                )
                                                            )}
                                                        </List>
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
                                                            <ListItem
                                                                key={i}
                                                                sx={{ pl: 0 }}
                                                            >
                                                                <ListItemText
                                                                    primary={`• ${getActionLabel(
                                                                        h.action
                                                                    )}`}
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

                                            {task.status === "done" && (
                                                <Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        gutterBottom
                                                    >
                                                        ⭐ Оценка работы:
                                                    </Typography>
                                                    <Rating
                                                        value={
                                                            task.rating ||
                                                            rating[task.id] ||
                                                            0
                                                        }
                                                        onChange={(_, value) =>
                                                            handleRate(
                                                                task.id,
                                                                value
                                                            )
                                                        }
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                    </Collapse>
                                </Box>
                            ))}
                        </List>
                    </Paper>
                )}

                {/* Диалог добавления комментария */}
                <Dialog
                    open={commentDialogOpen}
                    onClose={() => setCommentDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Добавить комментарий</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Комментарий"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCommentDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleAddComment} variant="contained">
                            Добавить
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог назначения исполнителя */}
                <Dialog
                    open={assigneeDialogOpen}
                    onClose={() => setAssigneeDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Назначить исполнителя</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                label="ID исполнителя"
                                value={assigneeData.id}
                                onChange={(e) =>
                                    setAssigneeData({
                                        ...assigneeData,
                                        id: e.target.value
                                    })
                                }
                            />
                            <TextField
                                fullWidth
                                label="Имя исполнителя"
                                value={assigneeData.name}
                                onChange={(e) =>
                                    setAssigneeData({
                                        ...assigneeData,
                                        name: e.target.value
                                    })
                                }
                            />
                            <TextField
                                fullWidth
                                label="Роль/Должность"
                                value={assigneeData.role}
                                onChange={(e) =>
                                    setAssigneeData({
                                        ...assigneeData,
                                        role: e.target.value
                                    })
                                }
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAssigneeDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button
                            onClick={handleUpdateAssignee}
                            variant="contained"
                        >
                            Назначить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
