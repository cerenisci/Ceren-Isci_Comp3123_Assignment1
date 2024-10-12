const express = require('express');
const { check, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const router = express.Router();

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new employee
router.post('/employees', [
    check('first_name').not().isEmpty(),
    check('last_name').not().isEmpty(),
    check('email').isEmail(),
    check('position').not().isEmpty(),
    check('salary').isNumeric(),
    check('date_of_joining').isISO8601(),
    check('department').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;
    try {
        const employee = new Employee({ first_name, last_name, email, position, salary, date_of_joining, department });
        await employee.save();
        res.status(201).json({ message: 'Employee created successfully', employee_id: employee._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get employee by ID
router.get('/employees/:eid', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.eid);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update employee details
router.put('/employees/:eid', [
    check('salary').optional().isNumeric(),
    check('position').optional().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const employee = await Employee.findByIdAndUpdate(req.params.eid, req.body, { new: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ message: 'Employee details updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete employee
router.delete('/employees', async (req, res) => {
    const { eid } = req.query;
    try {
        const employee = await Employee.findByIdAndDelete(eid);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(204).json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
