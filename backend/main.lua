local logger = require("logger")
local millennium = require("millennium")
local fs = require("fs")

local function get_plugin_dir()
    local src = debug.getinfo(1, "S").source or ""
    src = src:gsub("^@", "")
    return fs.parent_path(fs.parent_path(src))
end

local function copy_icons_to_steamui()
    local success, err = pcall(function()
        local plugin_dir = get_plugin_dir()
        local static_dir = fs.join(plugin_dir, "static")
        local steam_path = millennium.steam_path()
        local target_dir = fs.join(steam_path, "steamui", "steam-streak")
        
        if not fs.exists(target_dir) then
            local ok, create_err = fs.create_directories(target_dir)
            if not ok then
                logger:error("[steam-streak] failed to create target_dir: " .. tostring(create_err))
                return
            end
        end
        
        local sentinel = fs.join(target_dir, "orange14x14.png")
        if fs.exists(sentinel) then
            return
        end
        
        if not fs.exists(static_dir) then
            logger:error("[steam-streak] static_dir does not exist: " .. tostring(static_dir))
            return
        end
        
        local icons = {
            "orange14x14.png", "orange80x80.png",
            "orangered14x14.png", "orangered80x80.png",
            "red14x14.png", "red80x80.png",
            "fiolet14x14.png", "fiolet80x80.png",
            "temnofiolet14x14.png", "temnofiolet80x80.png"
        }
        
        local copied = 0
        for _, icon in ipairs(icons) do
            local src_file = fs.join(static_dir, icon)
            local dst_file = fs.join(target_dir, icon)
            
            if fs.is_file(src_file) then
                local ok, copy_err = fs.copy(src_file, dst_file)
                if ok then
                    copied = copied + 1
                else
                    logger:error("[steam-streak] failed to copy " .. icon .. ": " .. tostring(copy_err))
                end
            end
        end
        
        if copied > 0 then
            logger:info("[steam-streak] copied " .. tostring(copied) .. " icons")
        end
    end)
    
    if not success then
        logger:error("[steam-streak] copy_icons_to_steamui failed: " .. tostring(err))
    end
end

local function on_load()
    local success, err = pcall(function()
        logger:info("[steam-streak] loading v1.0.0, Millennium " .. millennium.version())
        copy_icons_to_steamui()
        millennium.ready()
    end)
    
    if not success then
        logger:error("[steam-streak] on_load failed: " .. tostring(err))
        pcall(function() millennium.ready() end)
    end
end

local function on_frontend_loaded()
end

local function on_unload()
end

local function show_windows_notification(title, message, icon_path)
    local success, err = pcall(function()
        local escaped_title = title:gsub('"', '\\"')
        local escaped_message = message:gsub('"', '\\"')
        
        local ps_script = string.format([[
Add-Type -AssemblyName System.Windows.Forms
$notification = New-Object System.Windows.Forms.NotifyIcon
$notification.Icon = [System.Drawing.SystemIcons]::Information
$notification.BalloonTipTitle = "%s"
$notification.BalloonTipText = "%s"
$notification.Visible = $true
$notification.ShowBalloonTip(10000)
Start-Sleep -Seconds 10
$notification.Dispose()
]], escaped_title, escaped_message)
        
        local temp_file = os.getenv("TEMP") .. "\\steam_streak_notify.ps1"
        local f = io.open(temp_file, "w")
        if f then
            f:write(ps_script)
            f:close()
            
            local command = 'powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "' .. temp_file .. '"'
            os.execute(command)
            
            logger:info("[steam-streak] Windows notification shown: " .. title)
        else
            logger:error("[steam-streak] Failed to create temp file")
        end
        
        return true
    end)
    
    if not success then
        logger:error("[steam-streak] show_windows_notification failed: " .. tostring(err))
        return false
    end
    
    return true
end

return {
    on_load = on_load,
    on_frontend_loaded = on_frontend_loaded,
    on_unload = on_unload,
    show_windows_notification = show_windows_notification
}
