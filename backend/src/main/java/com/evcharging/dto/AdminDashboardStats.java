package com.evcharging.dto;

public class AdminDashboardStats {
    private long totalUsers;
    private long totalCustomers;
    private long totalOperators;
    private long totalStations;
    private long totalChargers;
    private long activeChargers;
    private long activeSessions;
    private long todayBookings;
    private long totalBookings;
    private double totalRevenue;

    public AdminDashboardStats() {}

    public AdminDashboardStats(long totalUsers, long totalCustomers, long totalOperators, long totalStations, long totalChargers, long activeChargers, long activeSessions, long todayBookings, long totalBookings, double totalRevenue) {
        this.totalUsers = totalUsers;
        this.totalCustomers = totalCustomers;
        this.totalOperators = totalOperators;
        this.totalStations = totalStations;
        this.totalChargers = totalChargers;
        this.activeChargers = activeChargers;
        this.activeSessions = activeSessions;
        this.todayBookings = todayBookings;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalUsers;
        private long totalCustomers;
        private long totalOperators;
        private long totalStations;
        private long totalChargers;
        private long activeChargers;
        private long activeSessions;
        private long todayBookings;
        private long totalBookings;
        private double totalRevenue;

        public Builder totalUsers(long totalUsers) { this.totalUsers = totalUsers; return this; }
        public Builder totalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; return this; }
        public Builder totalOperators(long totalOperators) { this.totalOperators = totalOperators; return this; }
        public Builder totalStations(long totalStations) { this.totalStations = totalStations; return this; }
        public Builder totalChargers(long totalChargers) { this.totalChargers = totalChargers; return this; }
        public Builder activeChargers(long activeChargers) { this.activeChargers = activeChargers; return this; }
        public Builder activeSessions(long activeSessions) { this.activeSessions = activeSessions; return this; }
        public Builder todayBookings(long todayBookings) { this.todayBookings = todayBookings; return this; }
        public Builder totalBookings(long totalBookings) { this.totalBookings = totalBookings; return this; }
        public Builder totalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; return this; }

        public AdminDashboardStats build() {
            return new AdminDashboardStats(totalUsers, totalCustomers, totalOperators, totalStations, totalChargers, activeChargers, activeSessions, todayBookings, totalBookings, totalRevenue);
        }
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalOperators() { return totalOperators; }
    public void setTotalOperators(long totalOperators) { this.totalOperators = totalOperators; }

    public long getTotalStations() { return totalStations; }
    public void setTotalStations(long totalStations) { this.totalStations = totalStations; }

    public long getTotalChargers() { return totalChargers; }
    public void setTotalChargers(long totalChargers) { this.totalChargers = totalChargers; }

    public long getActiveChargers() { return activeChargers; }
    public void setActiveChargers(long activeChargers) { this.activeChargers = activeChargers; }

    public long getActiveSessions() { return activeSessions; }
    public void setActiveSessions(long activeSessions) { this.activeSessions = activeSessions; }

    public long getTodayBookings() { return todayBookings; }
    public void setTodayBookings(long todayBookings) { this.todayBookings = todayBookings; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
}
