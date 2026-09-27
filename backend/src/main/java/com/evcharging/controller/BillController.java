package com.evcharging.controller;

import com.evcharging.entity.Bill;
import com.evcharging.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Bill> getBillBySessionId(@PathVariable Long sessionId) {
        return ResponseEntity.ok(billService.getBillBySessionId(sessionId));
    }
}
