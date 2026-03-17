"""
restart_launcher.py
Relança o PlayAds após o processo principal encerrar.
Uso: python restart_launcher.py <pid> <exe_path> [args...]
"""
import sys, os, time

def main():
    if len(sys.argv) < 3:
        print("uso: restart_launcher.py <pid> <exe> [args...]")
        sys.exit(1)

    parent_pid = int(sys.argv[1])
    exe        = sys.argv[2]
    args       = sys.argv[3:]

    # Aguarda o processo pai morrer (máx 15s)
    import ctypes
    deadline = time.time() + 15
    while time.time() < deadline:
        try:
            handle = ctypes.windll.kernel32.OpenProcess(0x100000, False, parent_pid)  # SYNCHRONIZE
            if handle == 0:
                break  # processo já morreu
            ctypes.windll.kernel32.CloseHandle(handle)
        except:
            break
        time.sleep(0.3)

    time.sleep(0.8)  # margem extra para .NET liberar recursos

    # Relança o app
    os.execv(exe, [exe] + args)

if __name__ == "__main__":
    main()