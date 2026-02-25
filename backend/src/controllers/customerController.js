import Customer from "../models/customer.js";
import jwt from "jsonwebtoken"; 


export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};


export const getCustomerProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id); // Use user id from JWT
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateCustomerProfile = async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true }
        );
        if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteCustomerProfile = async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            { isActive: false },
            { new: true }
        );
        if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateCustomerTier = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

       
        if (customer.loyaltyPoints > 5000) {
            customer.membershipTier = 'Gold';
        } else if (customer.loyaltyPoints > 1000) {
            customer.membershipTier = 'Silver';
        } else {
            customer.membershipTier = 'Bronze';
        }

        await customer.save(); 
        res.status(200).json({ message: 'Membership tier updated successfully', customer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
