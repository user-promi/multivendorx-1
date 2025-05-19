import React,{ useState, useRef } from "react";
import {Link} from 'react-router-dom';
import { getApiLink, sendApiResponse } from "./apiService";
import '../styles/web/ConnectButton.scss';


interface Task {
    action: string;
    message: string;
    cache?: "course_id" | "user_id";
}

export interface ConnectButtonProps {
    apiLink: string;
    tasks: Task[];
    appLocalizer: Record<string, any>; // Allows any structure
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ appLocalizer ,apiLink, tasks }) => {
    const connectTaskStarted = useRef<boolean>(false);
    const additionalData = useRef<Record<string, any>>({});
    const taskNumber = useRef<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [taskSequence, setTaskSequence] = useState<{ name: string; message: string; status: string }[]>([]);
    const [testStatus, setTestStatus] = useState<string>("");

    // Sleep for a given time.
    const sleep = (time: number): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, time));
    };

    const startConnectionTask = async () => {
        if (connectTaskStarted.current) return;

        connectTaskStarted.current = true;
        setLoading(true);
        setTaskSequence([]);

        await doSequentialTask();

        connectTaskStarted.current = false;
        setLoading(false);
    };

    const doSequentialTask = async () => {
        if (taskNumber.current >= tasks.length) {
            setTestStatus("Test Successful");
            return;
        }

        const currentTask = tasks[taskNumber.current];

        setTaskSequence((tasks) => [
            ...tasks,
            { name: currentTask.action, message: currentTask.message, status: "running" },
        ]);

        await sleep(2500);

        const response = await sendApiResponse(appLocalizer,getApiLink(appLocalizer,apiLink), {
            action: currentTask.action,
            ...additionalData.current,
        });

        let taskStatus: "success" | "failed" = "success";

        if (currentTask.cache === "course_id") {
            // const validCourse = response?.courses?.[1];
            const validCourse = response;
            if (!validCourse) {
                taskStatus = "failed";
            } else {
                // additionalData.current["course_id"] = validCourse.id;
                additionalData.current["course_id"] = validCourse;
            }
        } else if (currentTask.cache === "user_id") {
            // const validUser = response?.data?.users?.[0];
            const validUser = response;
            if (!validUser) {
                taskStatus = "failed";
            } else {
                // additionalData.current["user_id"] = validUser.id;
                additionalData.current["user_id"] = validUser;
            }
        // } else if (!response.success) {
        } else if (!response) {
            taskStatus = "failed";
        }

        setTaskSequence((tasks) => {
            const updatedTask = [...tasks];
            updatedTask[updatedTask.length - 1].status = taskStatus;
            return updatedTask;
        });

        if (taskStatus === "failed") {
            setTestStatus("Failed");
            return;
        }

        taskNumber.current++;
        await doSequentialTask();
    };

    return (
        <div className="connection-test-wrapper">
            <div className="loader-wrapper">
                <button
                    className="btn-purple btn-effect"
                    onClick={(e) => {
                        e.preventDefault();
                        startConnectionTask();
                    }}
                >
                    {"Start test"}
                </button>
                {loading && (
                    <div className="loader">
                        <div className="three-body__dot"></div>
                        <div className="three-body__dot"></div>
                        <div className="three-body__dot"></div>
                    </div>
                )}
            </div>
            <div className="fetch-details-wrapper">
                {taskSequence.map((task, index) => (
                    <div key={index} className={`${task.status} details-status-row`}>
                        {task.message} {task.status !== "running" && (
                            <i className={`admin-font ${task.status === "failed" ? "adminLib-cross" : "adminLib-icon-yes"}`}></i>
                        )}
                    </div>
                ))}
            </div>
            {testStatus && (
                <div className={`fetch-display-output ${testStatus === "Failed" ? "failed" : "success"}`}>
                    {testStatus === "Failed" ? (
                        <p>
                            { 'Test connection failed. Check further details in' } {' '}
                            <Link className="errorlog-link" to={'?page=moowoodle#&tab=settings&subtab=log'}>
                                { 'error log' }
                            </Link>.
                        </p>
                    ) : (
                         'Test connection successful'
                    )}
                </div>
            )}
        </div>
    );
};

export default ConnectButton;
