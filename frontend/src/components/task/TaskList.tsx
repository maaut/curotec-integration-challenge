import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Select,
  Popconfirm,
  Tag,
  Switch,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTasks } from "../../hooks/useTasks";

import type { Task, GetAllTasksParams } from "../../types/task.types";
import type { TableProps, TablePaginationConfig } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import EditTaskModal, {
  type TaskFormValues as EditTaskFormValues,
} from "./EditTaskModal";
import { useAuth } from "../../providers/AuthContext";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface AddTaskFormValues {
  title: string;
  description: string;
}

const TaskList: React.FC = () => {
  const {
    loading,
    tasks,
    tasksState,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    setTasksState,
  } = useTasks();
  const { user } = useAuth();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm<AddTaskFormValues>();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  const handleAddTask = async (values: AddTaskFormValues) => {
    await addTask(values);
    handleAddCancel();
  };

  const showEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleUpdateTask = async (values: EditTaskFormValues) => {
    if (editingTask) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _, ...taskData } = editingTask;
      await updateTask(editingTask.id, { ...taskData, ...values });
    }
    setIsEditModalVisible(false);
  };

  useEffect(() => {
    if (!isEditModalVisible) {
      setEditingTask(null);
    }
  }, [isEditModalVisible]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Task> | SorterResult<Task>[]
  ) => {
    const newParams: Partial<GetAllTasksParams> = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    if (!Array.isArray(sorter)) {
      if (sorter.field && sorter.order) {
        newParams.sortBy = String(sorter.field);
        newParams.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
      } else {
        newParams.sortBy = "createdAt";
        newParams.sortOrder = "desc";
      }
    }

    setTasksState(newParams);
    fetchTasks(newParams);
  };

  const handleSearch = (value: string) => {
    const newParams = { search: value, page: 1 };
    setTasksState(newParams);
    fetchTasks(newParams);
  };

  const handleStatusFilterChange = (value: "all" | "true" | "false") => {
    const newParams = { completed: value, page: 1 };
    setTasksState(newParams);
    fetchTasks(newParams);
  };

  const columns: TableProps<Task>["columns"] = [
    {
      title: "Completed",
      dataIndex: "completed",
      key: "completed",
      width: 100,
      render: (completed: boolean, record: Task) => (
        <Switch
          checked={completed}
          onChange={() => toggleComplete(record.id)}
          disabled={loading || record.userId !== user?.id}
          style={{
            backgroundColor: completed ? "green" : "#f0f2f5",
          }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Ownership",
      dataIndex: "userId",
      key: "userId",
      render: (userId: string) => {
        return (
          <Tag color={userId === user?.id ? "blue" : "orange"}>
            {userId === user?.id ? "Owner" : "Invitee"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record: Task) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            disabled={loading}
          />
          <Popconfirm
            title="Delete the task?"
            onConfirm={() => deleteTask(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={loading}
          >
            <Button icon={<DeleteOutlined />} danger disabled={loading} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && !tasks.length && !tasksState.totalTasks) {
    return (
      <Spin
        tip="Loading tasks..."
        style={{ display: "block", marginTop: "20px" }}
      />
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Title level={2}>Task List</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Task
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search tasks..."
          onSearch={handleSearch}
          style={{ width: 200 }}
          allowClear
          defaultValue={tasksState.search}
        />
        <Select
          defaultValue={tasksState.completed || "all"}
          style={{ width: 120 }}
          onChange={handleStatusFilterChange}
        >
          <Option value="all">All Statuses</Option>
          <Option value="true">Completed</Option>
          <Option value="false">Pending</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        rowHoverable={false}
        rowClassName={(record) => (record.completed ? "completed-row" : "")}
        pagination={{
          current: tasksState.page,
          pageSize: tasksState.limit,
          total: tasksState.totalTasks,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Add New Task"
        onCancel={handleAddCancel}
        open={isAddModalVisible}
        footer={null}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddTask}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: "Please input the title of the task!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: "Please input the description of the task!",
              },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ marginRight: 8 }}
            >
              Add Task
            </Button>
            <Button onClick={handleAddCancel} disabled={loading}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <EditTaskModal
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        onUpdate={handleUpdateTask}
        task={editingTask}
        loading={loading}
      />
    </div>
  );
};

export default TaskList;
