export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface UserResponse {
  status: "success";
  data: { user: User };
}

export interface LoginResponse extends UserResponse {
  data: {
    user: User;
    accessToken: string;
  };
}

export interface ErrorResponse {
  status: "fail" | "error";
  message: string;
}

export interface Weather {
  city: string;
  state: string | null;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  temperature: {
    current: number;
    feelsLike: number;
    minimum: number;
    maximum: number;
    unit: "celsius";
  };
  humidity: {
    value: number;
    unit: "percent";
  };
  conditions: {
    main: string | null;
    description: string | null;
  };
  wind: {
    speed: number;
    unit: "meters_per_second";
  };
}

export interface WeatherResponse {
  status: "success";
  data: Weather;
}

export type TaskApiStatus = "PENDING" | "CHECKED";
export type TaskInputStatus = "pending" | "checked";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  city: string | null;
  category: string;
  status: TaskApiStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskResponse {
  status: "success";
  data: { task: Task };
}

export interface TaskListResponse {
  status: "success";
  results: number;
  data: { tasks: Task[] };
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  city?: string | null;
  category?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  city?: string | null;
  category?: string;
  status?: TaskInputStatus;
}

export interface TaskFilters {
  status?: TaskInputStatus;
  category?: string;
}
