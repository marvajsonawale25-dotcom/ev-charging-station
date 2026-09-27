package com.evcharging.dto;

import com.evcharging.entity.Booking;
import com.evcharging.entity.ChargingSession;
import java.util.List;

public class CustomerDashboardStats {
    private long totalSessions;
    private double totalEnergyKwh;
    private double totalAmountSpent;
    private double carbonSavedKg;
    private ChargingSession activeSession;
    private Booking upcomingBooking;
    private List<Booking> recentBookings;

    public CustomerDashboardStats() {}

    public CustomerDashboardStats(long totalSessions, double totalEnergyKwh, double totalAmountSpent, double carbonSavedKg, ChargingSession activeSession, Booking upcomingBooking, List<Booking> recentBookings) {
        this.totalSessions = totalSessions;
        this.totalEnergyKwh = totalEnergyKwh;
        this.totalAmountSpent = totalAmountSpent;
        this.carbonSavedKg = carbonSavedKg;
        this.activeSession = activeSession;
        this.upcomingBooking = upcomingBooking;
        this.recentBookings = recentBookings;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalSessions;
        private double totalEnergyKwh;
        private double totalAmountSpent;
        private double carbonSavedKg;
        private ChargingSession activeSession;
        private Booking upcomingBooking;
        private List<Booking> recentBookings;

        public Builder totalSessions(long totalSessions) { this.totalSessions = totalSessions; return this; }
        public Builder totalEnergyKwh(double totalEnergyKwh) { this.totalEnergyKwh = totalEnergyKwh; return this; }
        public Builder totalAmountSpent(double totalAmountSpent) { this.totalAmountSpent = totalAmountSpent; return this; }
        public Builder carbonSavedKg(double carbonSavedKg) { this.carbonSavedKg = carbonSavedKg; return this; }
        public Builder activeSession(ChargingSession activeSession) { this.activeSession = activeSession; return this; }
        public Builder upcomingBooking(Booking upcomingBooking) { this.upcomingBooking = upcomingBooking; return this; }
        public Builder recentBookings(List<Booking> recentBookings) { this.recentBookings = recentBookings; return this; }

        public CustomerDashboardStats build() {
            return new CustomerDashboardStats(totalSessions, totalEnergyKwh, totalAmountSpent, carbonSavedKg, activeSession, upcomingBooking, recentBookings);
        }
    }

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }

    public double getTotalEnergyKwh() { return totalEnergyKwh; }
    public void setTotalEnergyKwh(double totalEnergyKwh) { this.totalEnergyKwh = totalEnergyKwh; }

    public double getTotalAmountSpent() { return totalAmountSpent; }
    public void setTotalAmountSpent(double totalAmountSpent) { this.totalAmountSpent = totalAmountSpent; }

    public double getCarbonSavedKg() { return carbonSavedKg; }
    public void setCarbonSavedKg(double carbonSavedKg) { this.carbonSavedKg = carbonSavedKg; }

    public ChargingSession getActiveSession() { return activeSession; }
    public void setActiveSession(ChargingSession activeSession) { this.activeSession = activeSession; }

    public Booking getUpcomingBooking() { return upcomingBooking; }
    public void setUpcomingBooking(Booking upcomingBooking) { this.upcomingBooking = upcomingBooking; }

    public List<Booking> getRecentBookings() { return recentBookings; }
    public void setRecentBookings(List<Booking> recentBookings) { this.recentBookings = recentBookings; }
}
