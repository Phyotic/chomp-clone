package com.phyoticGen.ChompClone;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChompController {

    @PostMapping("/checkout")
    public OrderItem[] checkout(@RequestBody OrderItem[] orderArray) {
        return orderArray;
    }
}