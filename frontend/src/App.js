import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * RDTS Dashboard - Frontend for Distributed Task Scheduler
 * Handles task dispatching, real-time status monitoring, and system metrics.
 */
function App() {
  const [taskNameInput, setTaskNameInput] = useState('');
  const [tasksList, setTasksList] = useState([]);
  const [systemStats, setSystemStats] = useState({ completed: 0, pending: 0, failed: 0, workers_active: false });

  // 1. Fetch current tasks from the backend API
  const fetchTasksData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/tasks');
      setTasksList(response.data);
    } catch (apiError) {
      console.error("Task synchronization failed:", apiError);
    }
  };

  // 2. Fetch real-time system metrics (Success, Pending, DLQ)
  const fetchSystemMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:8000/stats');
      setSystemStats(response.data);
    } catch (apiError) {
      console.error("Metric retrieval error:", apiError);
    }
  };

 // 3. Establish polling interval for live dashboard updates 
  useEffect(() => {
    fetchTasksData();
    fetchSystemMetrics();
    const refreshInterval = setInterval(() => {
      fetchTasksData();
      fetchSystemMetrics();
    }, 3000); // 3-second polling interval
    return () => clearInterval(refreshInterval);
  }, []);

  // Handler for dispatching new tasks to the Redis queue
  const handleTaskDispatch = async () => {
    if (!taskNameInput) return;
    try {
      // POST request to trigger the distributed task pipeline
      await axios.post('http://localhost:8000/tasks', { name: taskNameInput });
      fetchTasksData();
      fetchSystemMetrics();
      setTaskNameInput('');
    } catch (apiError) {
      console.error("Dispatch failure:", apiError);
      alert("System Error: Unable to dispatch task. Please verify backend connectivity.");
    }
  };

  return (
    <div style={{
      fontFamily: 'sans-serif',
      padding: '40px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Dashboard Header Container */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', color: '#475569' }}>
          <div style={{ width: '28px', height: '28px', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '4px', fontSize: '18px' }}>&equiv;</div>
          RDTS <span style={{ color: '#94a3b8', fontWeight: 'normal', marginLeft: '5px' }}>Engine</span>
        </div>
        <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
  <div style={{ 
    width: '8px', 
    height: '8px', 
    backgroundColor: systemStats.workers_active ? '#22c55e' : '#dc2626', 
    borderRadius: '50%' 
  }}></div>
  System Status: <span style={{ color: systemStats.workers_active ? '#22c55e' : '#dc2626', fontWeight: 'bold' }}>
    {systemStats.workers_active ? 'Online' : 'Offline'}
  </span>
</div>
      </div>

      {/* Monitoring Metrics Overview */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>SUCCESS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{systemStats.completed}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 'bold' }}>PENDING</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{systemStats.pending}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold' }}>FAILED (DLQ)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{systemStats.failed}</div>
        </div>
      </div>

      {/* Control Panel: Trigger New Tasks */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', marginBottom: '25px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Trigger New Task</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <input
            value={taskNameInput}
            onChange={(e) => setTaskNameInput(e.target.value)}
            placeholder="e.g. Process User Data Batch #102"
            style={{
              flex: 1,
              padding: '14px 20px',
              fontSize: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          />
          <button
            onClick={handleTaskDispatch}
            style={{
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>▶</span> Dispatch
          </button>
        </div>
      </div>

      {/* Task Lifecycle View: Process Queue */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', marginBottom: '20px' }}>
          <span style={{ fontSize: '18px' }}>≡</span>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Active Task Queue</h3>
        </div>

        {tasksList.length === 0 ? (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px',
            border: '2px dashed #e2e8f0', borderRadius: '12px', color: '#94a3b8', fontSize: '15px', backgroundColor: '#fff'
          }}>
            No active tasks found in system queue..
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasksList.map((taskItem) => (
              <div key={taskItem.id} style={{
                backgroundColor: '#fff', padding: '16px 24px', borderRadius: '10px',
                border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>

                {/* SYNC: Using taskItem properties */}
                <div style={{ fontSize: '16px', color: '#1e293b' }}>{taskItem.name}</div>
                <div style={{
                  fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                  color: taskItem.task_status === 'Completed' ? '#16a34a' : '#ca8a04',
                  backgroundColor: taskItem.task_status === 'Completed' ? '#dcfce7' : '#fef9c3',
                  padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <div style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%' }}></div>
                  {taskItem.task_status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;