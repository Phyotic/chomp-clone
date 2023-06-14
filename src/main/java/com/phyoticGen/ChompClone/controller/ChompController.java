package com.phyoticGen.ChompClone.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.phyoticGen.ChompClone.model.OrderItem;

@RestController
public class ChompController {

    @PostMapping("/checkout")
    public OrderItem[] checkout(@RequestBody OrderItem[] orderArray) {
        return orderArray;
    }
}