import { useEffect, useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { useAxios } from "../../hooks";

interface Task {
  id: number;
  name: string;
  done: boolean;
}

export const TaskPage = () => {
  const axios = useAxios();
  const API = import.meta.env.VITE_API_URL;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks`);

      let data: Task[] = [];

      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data.tasks)) data = res.data.tasks;
      else if (Array.isArray(res.data.data)) data = res.data.data;

      setTasks(data);
    } catch (error) {
      console.error(error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async () => {
    if (!newTask.trim()) return;

    try {
      await axios.post(`${API}/tasks`, { name: newTask });
      setNewTask("");
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`${API}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await axios.patch(`${API}/tasks/${task.id}`, {
        done: !task.done,
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const updateTask = async (id: number) => {
    if (!editText.trim()) return;

    try {
      await axios.put(`${API}/tasks/${id}`, {
        name: editText,
      });
      setEditingId(null);
      setEditText("");
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((task) => {
      if (filter === "pending") return !task.done;
      if (filter === "done") return task.done;
      return true;
    });

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography
        variant="h4"
        sx={{ textAlign: "center", mb: 4 }}
      >
        📝 Gestión de Tareas
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        {/* CREAR */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Crear nueva tarea
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            label="Escribe una tarea..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <Button variant="contained" onClick={createTask}>
            Agregar
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        {/* BUSCAR + FILTROS */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Buscar y filtrar
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, value) => value && setFilter(value)}
          >
            <ToggleButton value="all">Todas</ToggleButton>
            <ToggleButton value="pending">Pendientes</ToggleButton>
            <ToggleButton value="done">Finalizadas</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 3 }}>
        {/* CABECERA TIPO TABLA */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 150px 200px",
            p: 2,
            fontWeight: "bold",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography>Tarea</Typography>
          <Typography>Estado</Typography>
          <Typography>Acciones</Typography>
        </Box>

        {/* LISTA */}
        {filteredTasks.length === 0 && (
          <Typography sx={{ textAlign: "center", p: 3 }}>
            No hay tareas
          </Typography>
        )}

        {filteredTasks.map((task) => (
          <Box
            key={task.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 150px 200px",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #eee",
              "&:hover": {
                backgroundColor: "#f9f9f9",
              },
            }}
          >
            {/* NOMBRE */}
            {editingId === task.id ? (
              <TextField
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            ) : (
              <Typography
                sx={{
                  textDecoration: task.done ? "line-through" : "none",
                }}
              >
                {task.name}
              </Typography>
            )}

            {/* ESTADO */}
            <Chip
              label={task.done ? "Finalizada" : "Pendiente"}
              color={task.done ? "success" : "warning"}
            />

            {/* ACCIONES */}
            <Box>
              <IconButton onClick={() => toggleTask(task)}>
                <CheckIcon />
              </IconButton>

              {editingId === task.id ? (
                <Button onClick={() => updateTask(task.id)}>
                  Guardar
                </Button>
              ) : (
                <IconButton
                  onClick={() => {
                    setEditingId(task.id);
                    setEditText(task.name);
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}

              <IconButton onClick={() => deleteTask(task.id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Paper>
    </Container>
  );
};