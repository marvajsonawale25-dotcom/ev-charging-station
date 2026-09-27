package com.evcharging.dto;

import com.evcharging.entity.Booking;
import com.evcharging.entity.ChargingSession;
import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargingStation;

import java.util.List;

public class OperatorDashboardStats {

    private ChargingStation station;
    private List<Charger> chargers;
    private List<Booking> todaysBookings;
    private List<ChargingSession> activeSessions;

    private double totalRevenueToday;
    private double totalKwhDeliveredToday;

    // Keep existing aggregate statistics as well
    private long totalStations;
    private long totalChargers;
    private long availableChargers;
    private long occupiedChargers;
    private long todayBookings;
    private long activeSessionCount;
    private double totalRevenue;
    private double chargerUtilizationPercentage;

    public OperatorDashboardStats() {}

    public ChargingStation getStation() {
        return station;
    }

    public void setStation(ChargingStation station) {
        this.station = station;
    }

    public List<Charger> getChargers() {
        return chargers;
    }

    public void setChargers(List<Charger> chargers) {
        this.chargers = chargers;
    }

    public List<Booking> getTodaysBookings() {
        return todaysBookings;
    }

    public void setTodaysBookings(List<Booking> todaysBookings) {
        this.todaysBookings = todaysBookings;
    }

    public List<ChargingSession> getActiveSessions() {
        return activeSessions;
    }

    public void setActiveSessions(List<ChargingSession> activeSessions) {
        this.activeSessions = activeSessions;
    }

    public double getTotalRevenueToday() {
        return totalRevenueToday;
    }

    public void setTotalRevenueToday(double totalRevenueToday) {
        this.totalRevenueToday = totalRevenueToday;
    }

    public double getTotalKwhDeliveredToday() {
        return totalKwhDeliveredToday;
    }

    public void setTotalKwhDeliveredToday(double totalKwhDeliveredToday) {
        this.totalKwhDeliveredToday = totalKwhDeliveredToday;
    }

    public long getTotalStations() {
        return totalStations;
    }

    public void setTotalStations(long totalStations) {
        this.totalStations = totalStations;
    }

    public long getTotalChargers() {
        return totalChargers;
    }

    public void setTotalChargers(long totalChargers) {
        this.totalChargers = totalChargers;
    }

    public long getAvailableChargers() {
        return availableChargers;
    }

    public void setAvailableChargers(long availableChargers) {
        this.availableChargers = availableChargers;
    }

    public long getOccupiedChargers() {
        return occupiedChargers;
    }

    public void setOccupiedChargers(long occupiedChargers) {
        this.occupiedChargers = occupiedChargers;
    }

    public long getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(long todayBookings) {
        this.todayBookings = todayBookings;
    }

    public long getActiveSessionCount() {
        return activeSessionCount;
    }

    public void setActiveSessionCount(long activeSessionCount) {
        this.activeSessionCount = activeSessionCount;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getChargerUtilizationPercentage() {
        return chargerUtilizationPercentage;
    }

    public void setChargerUtilizationPercentage(double chargerUtilizationPercentage) {
        this.chargerUtilizationPercentage = chargerUtilizationPercentage;
    }
}