package com.evcharging.dto;

import com.evcharging.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull(message = "Bill ID is required")
    private Long billId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    public PaymentRequest() {}

    public PaymentRequest(Long billId, PaymentMethod paymentMethod) {
        this.billId = billId;
        this.paymentMethod = paymentMethod;
    }

    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}
