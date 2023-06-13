package com.phyoticGen.ChompClone;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChompController {

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@RequestBody String order) {
        return ResponseEntity.ok(order);
    }
}
