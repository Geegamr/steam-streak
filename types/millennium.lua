---@meta

---@class Millennium
---@field version fun(): string
---@field ready fun()
millennium = {}

---@class Logger
---@field info fun(message: string)
---@field warn fun(message: string)
---@field error fun(message: string)
---@field debug fun(message: string)
logger = {}

---@class FS
---@field exists fun(path: string): boolean
---@field is_file fun(path: string): boolean
---@field is_directory fun(path: string): boolean
---@field join fun(...: string): string
---@field parent_path fun(path: string): string
fs = {}
