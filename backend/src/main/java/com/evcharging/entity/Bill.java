package com.evcharging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing an Invoice / Bill generated after a charging session completes.
 */
@Entity
@Table(name = "bills")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_reference", nullable = false, unique = true, length = 50)
    private String billReference;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ChargingSession session;

    @NotNull
    @Column(name = "energy_consumed_kwh", nullable = false)
    private Double energyConsumedKwh;

    @NotNull
    @Column(name = "price_per_kwh", nullable = false)
    private Double pricePerKwh;

    @NotNull
    @Column(name = "base_amount", nullable = false)
    private Double baseAmount;

    @NotNull
    @Column(name = "tax_amount", nullable = false)
    private Double taxAmount;

    @NotNull
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "bill_status", nullable = false, length = 30)
    private BillStatus billStatus = BillStatus.UNPAID;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    public Bill() {}

    public Bill(Long id, String billReference, ChargingSession session, Double energyConsumedKwh, Double pricePerKwh, Double baseAmount, Double taxAmount, Double totalAmount, BillStatus billStatus, LocalDateTime generatedAt) {
        this.id = id;
        this.billReference = billReference;
        this.session = session;
        this.energyConsumedKwh = energyConsumedKwh;
        this.pricePerKwh = pricePerKwh;
        this.baseAmount = baseAmount;
        this.taxAmount = taxAmount;
        this.totalAmount = totalAmount;
        this.billStatus = billStatus != null ? billStatus : BillStatus.UNPAID;
        this.generatedAt = generatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String billReference;
        private ChargingSession session;
        private Double energyConsumedKwh;
        private Double pricePerKwh;
        private Double baseAmount;
        private Double taxAmount;
        private Double totalAmount;
        private BillStatus billStatus = BillStatus.UNPAID;
        private LocalDateTime generatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder billReference(String billReference) { this.billReference = billReference; return this; }
        public Builder session(ChargingSession session) { this.session = session; return this; }
        public Builder energyConsumedKwh(Double energyConsumedKwh) { this.energyConsumedKwh = energyConsumedKwh; return this; }
        public Builder pricePerKwh(Double pricePerKwh) { this.pricePerKwh = pricePerKwh; return this; }
        public Builder baseAmount(Double baseAmount) { this.baseAmount = baseAmount; return this; }
        public Builder taxAmount(Double taxAmount) { this.taxAmount = taxAmount; return this; }
        public Builder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder billStatus(BillStatus billStatus) { this.billStatus = billStatus; return this; }
        public Builder generatedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; return this; }

        public Bill build() {
            return new Bill(id, billReference, session, energyConsumedKwh, pricePerKwh, baseAmount, taxAmount, totalAmount, billStatus, generatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillReference() { return billReference; }
    public void setBillReference(String billReference) { this.billReference = billReference; }

    public ChargingSession getSession() { return session; }
    public void setSession(ChargingSession session) { this.session = session; }

    public Double getEnergyConsumedKwh() { return energyConsumedKwh; }
    public void setEnergyConsumedKwh(Double energyConsumedKwh) { this.energyConsumedKwh = energyConsumedKwh; }

    public Double getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(Double pricePerKwh) { this.pricePerKwh = pricePerKwh; }

    public Double getBaseAmount() { return baseAmount; }
    public void setBaseAmount(Double baseAmount) { this.baseAmount = baseAmount; }

    public Double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public BillStatus getBillStatus() { return billStatus; }
    public void setBillStatus(BillStatus billStatus) { this.billStatus = billStatus; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
