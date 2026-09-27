import React from 'react';
import { Zap, Heart, ShieldCheck, Database, Server, Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="row gy-4 mb-4">
          <div className="col-lg-5 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-badge" style={{ width: '32px', height: '32px' }}>
                <Zap size={18} />
              </div>
              <h5 className="text-white mb-0 fw-bold">VoltPoint EV Platform</h5>
            </div>
            <p className="text-muted small pe-lg-4">
              A comprehensive academic software project demonstrating modern full-stack software architecture for electric vehicle charging infrastructure management, slot reservation, simulated telemetry, and automated billing.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <span className="badge bg-dark border border-secondary text-light small"><Server size={12} className="me-1" /> Spring Boot 3.3</span>
              <span className="badge bg-dark border border-secondary text-light small"><Database size={12} className="me-1" /> PostgreSQL 18</span>
              <span className="badge bg-dark border border-secondary text-light small"><Code size={12} className="me-1" /> React 18</span>
              <span className="badge bg-dark border border-secondary text-light small"><ShieldCheck size={12} className="me-1" /> JWT Stateless Auth</span>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Core Workflow</h6>
            <ul className="list-unstyled text-muted small d-flex flex-column gap-2 mb-0">
              <li>1. 🔍 <strong>Discover:</strong> Browse stations & availability</li>
              <li>2. 📅 <strong>Reserve:</strong> Select compatible charger & slot</li>
              <li>3. ⚡ <strong>Charge:</strong> Simulated live telemetry & battery SoC</li>
              <li>4. 💳 <strong>Pay:</strong> GST invoice & simulated UPI/Card</li>
              <li>5. 📊 <strong>Track:</strong> History, energy & carbon offset</li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12">
            <h6 className="text-white fw-bold mb-3">Academic Context</h6>
            <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 small">
              <div className="text-light fw-bold mb-1">Second-Year Engineering Mini Project</div>
              <div className="text-muted mb-2">Subject: Advanced Java & Full-Stack Web Development</div>
              <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
                Designed with standard MVC/Repository layered architecture, high readability, and complete viva question & answer reference documentation.
              </div>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary border-opacity-25 pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
          <div>© {new Date().getFullYear()} VoltPoint EV Platform. Academic & Educational Use Only.</div>
          <div className="d-flex align-items-center gap-1 mt-2 mt-md-0">
            Engineered with <Heart size={14} className="text-danger" fill="#EF4444" /> for Engineering Sem 3 Mini-Project
          </div>
        </div>
      </div>
    </footer>
  );
}
